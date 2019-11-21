import { TestBed, inject } from '@angular/core/testing';

import { authService } from './auth.service';

describe('authService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [authService]
    });
  });

  it('should ...', inject([authService], (service: authService) => {
    expect(service).toBeTruthy();
  }));
});
