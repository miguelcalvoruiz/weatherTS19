import { CapitalizeFirstWordPipe } from "./capitalize-first-word.pipe";


describe('CapitalizeFirstWordPipe', () => {
  it('create an instance', () => {
    const pipe = new CapitalizeFirstWordPipe();
    expect(pipe).toBeTruthy();
  });
});
