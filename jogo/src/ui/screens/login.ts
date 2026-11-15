// Entrar ou registrar (e-mail/senha ou Google) antes do abrigo, só quando o Firebase está configurado.
import './login.css';
import type { Screen } from '../../core/router';
import { go } from '../../core/router';
import { h } from '../../core/dom';
import { hasGame, startNewGame } from '../../game/state';
import { authExigida, consumirErroAuth, mensagemAuth, temSessao } from '../../services/authEstado';
import { entrarComEmail, entrarComGoogle, registrarComEmail } from '../../services/firebaseRemoto';
import { seguirAposAuth } from '../../services/sessao';

type Modo = 'entrar' | 'registrar';

function validar(email: string, senha: string, registrar: boolean): string | null {
  if (!email) return 'Digite o e-mail.';
  if (!email.includes('@') || email.startsWith('@') || email.endsWith('@')) return 'E-mail inválido.';
  if (!senha) return 'Digite a senha.';
  if (registrar && senha.length < 6) return 'Senha fraca. Use pelo menos 6 caracteres.';
  return null;
}

export function loginScreen(): Screen {
  let vivo = true;
  let modo: Modo = 'entrar';
  let ocupado = false;

  function seguirLocal(): void {
    if (hasGame()) go('shelter', { intro: 'chegada' });
    else { startNewGame(); go('create'); }
  }

  return {
    mount(root) {
      if (!authExigida()) { seguirLocal(); return; }
      const erroInicial = consumirErroAuth();
      if (temSessao()) {
        root.replaceChildren(h(`<section class="screen login" aria-label="Entrar"><p class="login-espera">Entrando no abrigo…</p></section>`));
        void seguirAposAuth().catch((e) => {
          if (!vivo) return;
          desenhar(root, mensagemAuth(e));
        });
        return;
      }
      desenhar(root, erroInicial);
    },
    unmount() { vivo = false; },
  };

  function desenhar(root: HTMLElement, erro: string | null): void {
    root.replaceChildren(h(`<section class="screen login" aria-label="Entrar">
      <div class="login-card">
        <p class="eyebrow">Lua de Sangue</p>
        <h1 id="loginTitulo">Entrar</h1>
        <p class="lead" id="loginLead">A fogueira só abre para quem tem conta.</p>
        <div class="login-modos" role="tablist" aria-label="Entrar ou registrar">
          <button type="button" id="modoEntrar" role="tab" aria-selected="true">Entrar</button>
          <button type="button" id="modoRegistrar" role="tab" aria-selected="false">Registrar</button>
        </div>
        <form class="login-form" id="loginForm" novalidate>
          <div class="login-field">
            <label class="lbl" for="loginEmail">E-mail</label>
            <input id="loginEmail" name="email" type="email" inputmode="email" autocomplete="username" spellcheck="false" required>
          </div>
          <div class="login-field">
            <label class="lbl" for="loginSenha">Senha</label>
            <input id="loginSenha" name="password" type="password" autocomplete="current-password" required>
          </div>
          <p class="login-erro" id="loginErro" role="alert" hidden></p>
          <button class="btn big" type="submit" id="loginEnviar">Entrar</button>
        </form>
        <p class="login-ou">ou</p>
        <button class="btn ghost login-google" type="button" id="loginGoogle">Entrar com Google</button>
        <p class="login-nota">Conta nova do Google também entra por aqui.</p>
        <button class="login-voltar" type="button" id="loginVoltar">Voltar</button>
      </div>
    </section>`));

    const titulo = root.querySelector<HTMLElement>('#loginTitulo')!;
    const lead = root.querySelector<HTMLElement>('#loginLead')!;
    const form = root.querySelector<HTMLFormElement>('#loginForm')!;
    const email = root.querySelector<HTMLInputElement>('#loginEmail')!;
    const senha = root.querySelector<HTMLInputElement>('#loginSenha')!;
    const enviar = root.querySelector<HTMLButtonElement>('#loginEnviar')!;
    const google = root.querySelector<HTMLButtonElement>('#loginGoogle')!;
    const erroEl = root.querySelector<HTMLElement>('#loginErro')!;
    const tabEntrar = root.querySelector<HTMLButtonElement>('#modoEntrar')!;
    const tabRegistrar = root.querySelector<HTMLButtonElement>('#modoRegistrar')!;

    const mostrar = (msg: string | null) => {
      erroEl.hidden = !msg;
      erroEl.textContent = msg ?? '';
    };
    const travar = (on: boolean) => {
      ocupado = on;
      enviar.disabled = on;
      google.disabled = on;
      tabEntrar.disabled = on;
      tabRegistrar.disabled = on;
      email.disabled = on;
      senha.disabled = on;
    };
    const pintarModo = () => {
      const registrar = modo === 'registrar';
      tabEntrar.setAttribute('aria-selected', String(!registrar));
      tabRegistrar.setAttribute('aria-selected', String(registrar));
      titulo.textContent = registrar ? 'Criar conta' : 'Entrar';
      lead.textContent = registrar
        ? 'E-mail e senha novos. O abrigo fica nesta conta.'
        : 'A fogueira só abre para quem tem conta.';
      enviar.textContent = registrar ? 'Criar conta' : 'Entrar';
      senha.autocomplete = registrar ? 'new-password' : 'current-password';
      email.autocomplete = registrar ? 'email' : 'username';
    };

    mostrar(erro);
    pintarModo();
    email.focus();

    tabEntrar.addEventListener('click', () => { if (ocupado) return; modo = 'entrar'; mostrar(null); pintarModo(); });
    tabRegistrar.addEventListener('click', () => { if (ocupado) return; modo = 'registrar'; mostrar(null); pintarModo(); });
    root.querySelector('#loginVoltar')!.addEventListener('click', () => { if (!ocupado) go('landing'); });

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (ocupado || !vivo) return;
      const end = email.value.trim();
      const problema = validar(end, senha.value, modo === 'registrar');
      if (problema) { mostrar(problema); return; }
      mostrar(null);
      travar(true);
      enviar.textContent = modo === 'registrar' ? 'Criando conta…' : 'Entrando…';
      void (async () => {
        try {
          if (modo === 'registrar') await registrarComEmail(end, senha.value);
          else await entrarComEmail(end, senha.value);
        } catch (e) {
          if (!vivo) return;
          mostrar(mensagemAuth(e));
          travar(false);
          pintarModo();
          return;
        }
        try {
          await seguirAposAuth();
        } catch {
          if (!vivo) return;
          mostrar('Entrei, mas não consegui buscar o abrigo.');
          travar(false);
          pintarModo();
        }
      })();
    });

    google.addEventListener('click', () => {
      if (ocupado || !vivo) return;
      mostrar(null);
      travar(true);
      google.textContent = 'Abrindo o Google…';
      void (async () => {
        try {
          const via = await entrarComGoogle();
          if (via === 'redirect' || !vivo) return;
        } catch (e) {
          if (!vivo) return;
          mostrar(mensagemAuth(e));
          travar(false);
          google.textContent = 'Entrar com Google';
          return;
        }
        try {
          await seguirAposAuth();
        } catch {
          if (!vivo) return;
          mostrar('Entrei, mas não consegui buscar o abrigo.');
          travar(false);
          google.textContent = 'Entrar com Google';
        }
      })();
    });
  }
}
