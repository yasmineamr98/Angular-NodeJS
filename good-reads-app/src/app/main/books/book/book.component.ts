import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { BookService } from '../../../shared/services/Book/book.service';
import { Book } from '../../../shared/services/Book/Book';
import { Review } from '../../../shared/services/Review/review';
import { ReviewService } from '../../../shared/services/Review/review.service';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [CommonModule], // Add CommonModule to the imports array
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css'],
})
export class BookComponent implements OnInit {

  bookId: string | null = null;
  stars: number[] = [1, 2, 3, 4, 5];
  currentRating: number = 0;
  tempRating: number = 0;
  book: Book = {
    name: '',
    content: '',
    Rating: '',
    Reviews: '',
    author: null,
    authorId: null,
    Year: '',
    CoverPhoto: '',
    Category: null,
    categoryId: null,
  };
reviews: Review[] = [];

  constructor(private route: ActivatedRoute, protected bookService: BookService, protected ReviewService:ReviewService) {
    //get the id from urrl and set it to frrrom afterr  the /
    this.bookId = this.route.snapshot.paramMap.get('id');
    //get the boog using the book id 
    this.bookService.getBook(this.bookId??'Not found').then((book: any) => {
      this.book = book;
      this.reviews = book.reviews;
    });
    
  }

  ngOnInit(): void {
    this.bookId = this.route.snapshot.paramMap.get('id') ?? 'Not found';
  }

  highlightStars(index: number): void {
    this.tempRating = index + 1;
  }

  resetStars(): void {
    this.tempRating = this.currentRating;
  }

  rateBook(rating: number): void {
    this.currentRating = rating;
  }
  submitReview() {
    
    
    const userId= JSON.parse(sessionStorage.getItem('User')??'')._id ?? '';
    const review = {
      Title: 'Second test',
      content: 'Second test',
      Rating: 2,
      User: userId
    };
    this.ReviewService.CreateReview(review, this.bookId).then((review: any) => {
        this.reviews.push(review);
        console.log(review);
    });
  }
}
