import { Function, FunctionCode } from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';
import { Environment } from './env-config';

export class WwwRedirectFunction extends Construct {
  public readonly function: Function;

  constructor(scope: Construct, id: string, environment: Environment) {
    super(scope, id);

    this.function = new Function(this, 'Function', {
      code: FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var host = request.headers.host.value;
  if (host.indexOf('www.') === 0) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://' + host.substring(4) + request.uri }
      }
    };
  }
  return request;
}
      `.trim()),
      functionName: `profound-book-club-${environment}-www-redirect`,
    });
  }
}
