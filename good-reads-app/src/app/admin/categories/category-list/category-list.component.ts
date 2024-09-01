import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxImageCompressService } from 'ngx-image-compress';
import { PaginateService } from '../../../shared/services/Pagination/pagination.service';
import {Category } from '../../../shared/services/Category/category';
import { CategoryService } from '../../../shared/services/Category/category.service';
import { ChangeDetectorRef } from '@angular/core';
import { ColorPickerModule } from 'ngx-color-picker';


@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule,ColorPickerModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent {
  imagePreviewUrl: string | ArrayBuffer | null | undefined;
  public newItem: any = {};
  public modalAction: string = 'Add';
  public showModal = false;
  
  formData: any;

  constructor(private CategoryService: CategoryService,private cdr: ChangeDetectorRef,private imageCompress: NgxImageCompressService,
     protected PaginationService: PaginateService<Category>) {
    this.loadItems();
  }

  loadItems(): void {
    this.CategoryService.getCategories().then((data: any[]) => { 
      this.PaginationService.items = data;
      this.PaginationService.updatePaginatedItems();
    });
  }








  openModal(action: string, id?: any): void {

    this.modalAction = action;
    this.showModal = true;
    if (action === 'Edit' && id) {

      this.populateFormData(id);
    }
  }

  newFormData(){
    
  
    this.formData = new FormData();
  
  }

  closeModal(): void {
    this.showModal = false;
    this.newItem = {}; 
    this.newFormData();
  }

  addItem(): void {
    if (!this.formData) {
      this.newFormData();
    }

    const categoryJson = JSON.stringify(this.newItem);
    // const bookBlob = new Blob([bookJson], { type: 'application/json' });
    this.formData!.append('category', categoryJson!);
    // console.log(this.formData);
    this.CategoryService.CreateCategory(this.formData).then((res) => {    
      this.loadItems();
      this.closeModal();
     
    });
  }

  editItem(id: any): void {
    
    if (!this.formData) {
      this.newFormData();
    }

    const categoryJson = JSON.stringify(this.newItem);
    // const bookBlob = new Blob([bookJson], { type: 'application/json' });
    this.formData!.append('category', categoryJson!);
    // console.log(this.formData);
    

    this.CategoryService.updateCategory(id.toString(), this.formData).then(() => {
      this.loadItems();
      this.closeModal();
      this.newFormData();

      console.log(" updated successfully");
    
    });
  }

  deleteItem(id: string): void {
    
    this.CategoryService.deleteCategory(id).then(() => { 
      this.loadItems();
    });
  }

  populateFormData(id: any): void {
    const item = this.PaginationService.items.find(a => a._id == id)??{DateOfBirth:new Date().toISOString().split('T')[0]};

    if (item) {
      this.newItem = { ...item };

      this.cdr.detectChanges(); 
    } else {
      console.log('Item not found with id:', id);  
    }
  }

  SubmitModal(): void {
    const modalForm = document.getElementById("modalform") as HTMLElement;

    if (this.modalAction === "Add") {
      this.addItem();
    } else if (this.modalAction === "Edit") {
      const itemIdElement = modalForm.querySelector<HTMLInputElement>('#ItemId');
      if (itemIdElement) {
        const itemId = itemIdElement.value;
        this.editItem(itemId);
      } else {
        console.error('ItemId element not found');
      }
    }

    
    this.CategoryService.getCategories().then(() => {
      this.closeModal();
      this.loadItems();
    });
  }


}
