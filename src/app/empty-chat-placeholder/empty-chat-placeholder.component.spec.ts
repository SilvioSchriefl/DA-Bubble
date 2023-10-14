import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyChatPlaceholderComponent } from './empty-chat-placeholder.component';

describe('EmptyChatPlaceholderComponent', () => {
  let component: EmptyChatPlaceholderComponent;
  let fixture: ComponentFixture<EmptyChatPlaceholderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmptyChatPlaceholderComponent]
    });
    fixture = TestBed.createComponent(EmptyChatPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
