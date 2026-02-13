import { ParseObjectIdPipe } from './parse-object-id.pipe';

describe('ParseObjectIdPipe', () => {
  it('should be defined', () => {
    expect(new ParseObjectIdPipe(['auditoria_id'])).toBeDefined();
  });
});
