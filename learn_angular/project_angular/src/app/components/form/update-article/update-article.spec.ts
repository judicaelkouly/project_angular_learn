import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdateArticle } from './update-article';

describe('UpdateArticle', () => {
  let component: UpdateArticle;
  let fixture: ComponentFixture<UpdateArticle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateArticle],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateArticle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
