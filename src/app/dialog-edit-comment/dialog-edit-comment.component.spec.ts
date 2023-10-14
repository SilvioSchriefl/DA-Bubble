import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditCommentComponent } from './dialog-edit-comment.component';

describe('DialogEditCommentComponent', () => {
  let component: DialogEditCommentComponent;
  let fixture: ComponentFixture<DialogEditCommentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogEditCommentComponent]
    });
    fixture = TestBed.createComponent(DialogEditCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
