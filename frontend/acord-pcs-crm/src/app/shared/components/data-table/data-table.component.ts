import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'currency' | 'badge' | 'link';
  linkPrefix?: string;
  badgeClass?: (value: string) => string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'No records found';
  @Input() rowLink?: string;

  @Output() rowClick = new EventEmitter<any>();

  getValue(row: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], row);
  }

  formatValue(row: any, column: TableColumn): string {
    const value = this.getValue(row, column.key);
    if (value == null) return '—';

    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
      default:
        return String(value);
    }
  }

  getBadgeClass(value: string, column: TableColumn): string {
    if (column.badgeClass) {
      return column.badgeClass(value);
    }
    return 'bg-secondary';
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }
}
