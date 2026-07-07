import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="space-y-8 pt-10">
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size={28} />
      </div>
    </div>
  );
}
