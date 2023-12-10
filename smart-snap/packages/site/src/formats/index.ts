import protobuf from "protobufjs";

export interface INotificationMessage {
  id: string;
  message: string;
}

export const PNotificationMessage = new protobuf.Type("NotificationMessage")
  .add(new protobuf.Field("id", 1, "string"))
  .add(new protobuf.Field("message", 2, "string"))
