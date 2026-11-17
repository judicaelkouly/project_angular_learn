import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css'],
})
export class Pagination implements OnChanges {

  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 10;
  @Output() onClick: EventEmitter<number> = new EventEmitter();

  totalPages = 0;
  pages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalItems'] || changes['itemsPerPage']) {
      this.calculatePagination();
    }
  }

  calculatePagination(): void {
    if (this.totalItems && this.itemsPerPage) {
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    } else {
      this.totalPages = 0;
      this.pages = [];
    }
  }

  pageClicked(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.onClick.emit(page);
  }
}
