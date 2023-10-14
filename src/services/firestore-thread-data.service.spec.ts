import { TestBed } from '@angular/core/testing';

import { FirestoreThreadDataService } from './firestore-thread-data.service';

describe('FirestoreThreadDataService', () => {
  let service: FirestoreThreadDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirestoreThreadDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
