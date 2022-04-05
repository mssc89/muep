export class ApiResponse {
  status: String;
  message: Array<any>;

  constructor(data){
    this.status = data.status;
    this.message = data.message;
  }
}
