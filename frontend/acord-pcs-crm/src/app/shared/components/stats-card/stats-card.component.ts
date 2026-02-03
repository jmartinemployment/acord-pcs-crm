import { Component, Input } from '@angular/core';
import { DecimalPipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [DecimalPipe, CurrencyPipe],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.scss',
})
export class StatsCardComponent {
  @Input() label = '';
  @Input() value: number = 0;
  @Input() icon = 'bi-graph-up';
  @Input() bgColor = '#e3f2fd';
  @Input() iconColor = '#1976d2';
  @Input() isCurrency = false;
  @Input() change?: number;
}
