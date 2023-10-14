import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPplToChannelComponent } from './add-ppl-to-channel.component';

describe('AddPplToChannelComponent', () => {
  let component: AddPplToChannelComponent;
  let fixture: ComponentFixture<AddPplToChannelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddPplToChannelComponent]
    });
    fixture = TestBed.createComponent(AddPplToChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
