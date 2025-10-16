import { Skeleton } from "../skeleton";

export function GraphLoader() {
  return (
    <Skeleton
      style={{
        height: "240px",
        width: "100%",
        borderRadius: "16px",
      }}
      className="bg-zinc-500"
    ></Skeleton>
  );
}
