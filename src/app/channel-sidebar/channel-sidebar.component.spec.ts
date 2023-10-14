import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelSidebarComponent } from './channel-sidebar.component';

describe('ChannelSidebarComponent', () => {
  let component: ChannelSidebarComponent;
  let fixture: ComponentFixture<ChannelSidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelSidebarComponent]
    });
    fixture = TestBed.createComponent(ChannelSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
