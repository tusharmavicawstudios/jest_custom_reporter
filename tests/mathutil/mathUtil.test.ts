import { publishTestResults } from "../../test-runner";
import { add, multiply } from "./mathUtil";


describe('mathUtil', () => {
    afterAll(async () => {
        await publishTestResults(); 
      });
    
  describe('add', () => {
    it('[4] should add two numbers', () => {
      expect(add(2, 3)).toBe(5);    
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers', () => {
      expect(multiply(2, 3)).toBe(6);
    });
  });
});