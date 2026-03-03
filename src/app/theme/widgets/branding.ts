import { Component } from '@angular/core';

@Component({
  selector: 'app-branding',
  template: `
    <a class="branding" href="/">
      <img src="images/logoOM.png" class="branding-logo" alt="Orinasa Manage" />
    </a>
  `,
  styles: `
    .branding {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.2rem 0; /* espace haut et bas */
    }

    .branding-logo {
      width: 85%;
      max-width: 180px; /* évite qu’il soit trop grand */
      height: auto;
      object-fit: contain;
    }
  `,
})
export class Branding {}
