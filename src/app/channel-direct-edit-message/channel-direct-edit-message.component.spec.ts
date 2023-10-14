import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelDirectEditMessageComponent } from './channel-direct-edit-message.component';

describe('ChannelDirectEditMessageComponent', () => {
  let component: ChannelDirectEditMessageComponent;
  let fixture: ComponentFixture<ChannelDirectEditMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelDirectEditMessageComponent]
    });
    fixture = TestBed.createComponent(ChannelDirectEditMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
