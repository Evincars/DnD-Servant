import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {MatButton} from "@angular/material/button";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";

@Component({
  selector: 'app-root',
  template: `
      <mat-sidenav-container class="container">
          <mat-sidenav #sidenav mode="over">
              <p><button matButton (click)="sidenav.toggle()">Toggle</button></p>
              <p>
                  test
              </p>
          </mat-sidenav>

          <mat-sidenav-content>
              <p><button matButton (click)="sidenav.toggle()">Toggle</button></p>
              <p>
                  test
              </p>
          </mat-sidenav-content>
      </mat-sidenav-container>
  `,
  styles: `
      .container {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
      }
  `,
    imports: [RouterModule, MatSidenavContainer, MatSidenav, MatButton, MatSidenavContent],
})
export class App {
}
