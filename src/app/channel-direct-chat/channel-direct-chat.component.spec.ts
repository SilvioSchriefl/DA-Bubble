import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelDirectChatComponent } from './channel-direct-chat.component';

describe('ChannelDirectChatComponent', () => {
  let component: ChannelDirectChatComponent;
  let fixture: ComponentFixture<ChannelDirectChatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelDirectChatComponent]
    });
    fixture = TestBed.createComponent(ChannelDirectChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
