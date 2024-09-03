import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthorService } from '../../shared/services/Author/author.service';
import { Author } from '../../shared/services/Author/Author';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';



@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [CommonModule,NgxPaginationModule],
  templateUrl: './authors.component.html',
  styleUrl: './authors.component.css',
})
export class AuthorsComponent {
[x: string]: any;
ToPage(arg0: number) {
  this.currentPage = arg0;
}
 
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
  Authors$ = this.AuthorService.Authors$;
  AuthorsList: Author[] = [];
  constructor(protected AuthorService: AuthorService  , protected Rrouter:Router) {
    this.AuthorService.getAuthors().then(Authors=>{
      this.AuthorsList = Authors;
      this.Authors$.set(Authors);
      this.totalPages = Math.ceil(this.AuthorsList.length/this.itemsPerPage);
    });

  }
  totalItems: number= 0;
  currentPage:number  = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;

}
