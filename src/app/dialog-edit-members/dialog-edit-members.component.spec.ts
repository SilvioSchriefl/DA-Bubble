import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditMembersComponent } from './dialog-edit-members.component';

describe('DialogEditMembersComponent', () => {
  let component: DialogEditMembersComponent;
  let fixture: ComponentFixture<DialogEditMembersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogEditMembersComponent]
    });
    fixture = TestBed.createComponent(DialogEditMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
