import { Component, ViewEncapsulation, Input, OnChanges, ChangeDetectorRef, SimpleChanges, OnInit, ElementRef } from '@angular/core';
import * as marked from 'marked';
import 'github-markdown-css';

@Component({
  templateUrl: './zap-markdown.component.html',
  styleUrls: [
    '/node_modules/github-markdown-css/github-markdown.css',
    './zap-markdown.component.css',
  ],
  encapsulation: ViewEncapsulation.Emulated
})
export class ZapMarkdownComponent implements OnInit, OnChanges {

  @Input() url: string;


  constructor(
    private cd: ChangeDetectorRef,
    private el: ElementRef,
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.url || changes.url.previousValue === this.url) return;
    getUrlText(this.url).catch(() => '').then(text => {
      this.el.nativeElement.innerHTML = text ? marked(text) : '';
    }).catch(e => {
      this.el.nativeElement.innerHTML = e.message;
    });
  }

}


function getUrlText(url: string): Promise<string> {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => { setTimeout(() => { reject(new Error('Request timeout.')); }, 2000); }),
  ]).then((response: any) => response.text());
}
