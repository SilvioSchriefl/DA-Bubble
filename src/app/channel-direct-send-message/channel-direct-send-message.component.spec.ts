import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelDirectSendMessageComponent } from './channel-direct-send-message.component';

describe('ChannelDirectSendMessageComponent', () => {
  let component: ChannelDirectSendMessageComponent;
  let fixture: ComponentFixture<ChannelDirectSendMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelDirectSendMessageComponent]
    });
    fixture = TestBed.createComponent(ChannelDirectSendMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
