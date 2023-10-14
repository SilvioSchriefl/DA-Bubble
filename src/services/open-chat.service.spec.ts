import { TestBed } from '@angular/core/testing';

import { OpenChatService } from './open-chat.service';

describe('OpenChatService', () => {
  let service: OpenChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
