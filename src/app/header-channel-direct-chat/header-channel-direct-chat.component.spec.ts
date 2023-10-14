import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderChannelDirectChatComponent } from './header-channel-direct-chat.component';

describe('HeaderChannelDirectChatComponent', () => {
  let component: HeaderChannelDirectChatComponent;
  let fixture: ComponentFixture<HeaderChannelDirectChatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderChannelDirectChatComponent]
    });
    fixture = TestBed.createComponent(HeaderChannelDirectChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
