import { TestBed } from '@angular/core/testing';

import { ReactionBubbleService } from './reaction-bubble.service';

describe('ReactionBubbleService', () => {
  let service: ReactionBubbleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReactionBubbleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
