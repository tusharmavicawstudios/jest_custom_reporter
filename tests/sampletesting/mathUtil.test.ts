import { add, multiply } from "./mathUtil";


  describe('sample',()=> {
    it('[8]should multiply two numbers', () => {
      expect(multiply(2, 3)).toBe(6);
    });
    it('[3]should add two numbers', () => {
      expect(add(2, 3)).toBe(5);    
    });
  })
// describe('mathUtil', () => {

//   describe('add', () => {
//     it('[3] should add two numbers', () => {
//       expect(add(2, 3)).toBe(5);    
//     });
//   });
  
//   describe('multiply', () => {
//     it('[4] should multiply two numbers', () => {
//       expect(multiply(2, 3)).toBe(5);
//     });
    
//   });
// });