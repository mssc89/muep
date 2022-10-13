export class ScheduleData {
  name: String;
  values: {
    type: {
      id: Number;
      name: String;
    };
    department: {
      id: Number;
      name: String;
    };
    cycle: {
      id: Number;
      name: String;
    };
    year: {
      id: Number;
      name: String;
    };
    group: {
      id: Number;
      name: String;
    };
    album: Number;
  };

  constructor(name, values){
    this.name = name;
    this.values = values;
  }
}
