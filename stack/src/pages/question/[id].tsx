import QuestionDetail from "@/components/QuestionDetail";
import Mainlayout from "@/layout/Mainlayout";
import { useRouter } from "next/router";

export default function QuestionPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Mainlayout>
      <QuestionDetail questionId={id as string} />
    </Mainlayout>
  );
}