// review.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../BaseService';
import { Review } from './review';


@Injectable({
  providedIn: 'root',
})
export class ReviewService extends BaseService {
  deleteReview(id: string) {
    return this.delete(this.ReviewsEndpoint + '/' + id);
  }
  updateReview(id: any, formData: any) {
    return this.put(this.ReviewsEndpoint + '/' + id, formData);
  }
  CreateReview(formData: any,bookId:any) : Promise<Review> {
    return this.post(this.ReviewsEndpoint + "/"+bookId, formData);
  }
  private ReviewsEndpoint = 'Reviews';
  Reviews$ = signal<Review[]>([]);

  constructor(protected override httpClient: HttpClient) {
    super(httpClient);
  }

  private async refreshReviews(): Promise<void> {
    const categories = await this.get<Review[]>(this.ReviewsEndpoint);
    this.Reviews$.set(categories ?? []);
  }

  async getReviews(): Promise<Review[]> {
    await this.refreshReviews();
    return this.Reviews$() ?? [];
  }
  async getReviewReviews(reviewName: string): Promise<Review[]> {
    return   await this.get<Review[]>(this.ReviewsEndpoint+"/"+reviewName);
  }
}
export { Review };
