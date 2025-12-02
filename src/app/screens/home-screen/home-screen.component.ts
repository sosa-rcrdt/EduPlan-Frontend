import { Component, OnInit } from '@angular/core';
import { UserRole } from 'src/app/models/auth.models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home-screen',
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.scss']
})
export class HomeScreenComponent implements OnInit{

  public rol:UserRole = "";

  constructor(
    private auth: AuthService
  ){}

  ngOnInit(): void {
    this.rol = this.auth.getCurrentRole();
    console.log("Rol: ", this.rol);

  }
}
