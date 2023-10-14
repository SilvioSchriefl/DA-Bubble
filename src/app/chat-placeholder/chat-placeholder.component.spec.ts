import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatPlaceholderComponent } from './chat-placeholder.component';

describe('ChatPlaceholderComponent', () => {
  let component: ChatPlaceholderComponent;
  let fixture: ComponentFixture<ChatPlaceholderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatPlaceholderComponent]
    });
    fixture = TestBed.createComponent(ChatPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
