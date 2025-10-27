import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AdaptiveButton } from "../Button/AdaptiveButton";
import { Forward } from "lucide-react";

const GenerateLink = ({ NoteColors }: { NoteColors: string }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <AdaptiveButton noteColor={NoteColors} aria-label="Bring note forward">
          <Forward className="w-3.5 h-3.5" />
        </AdaptiveButton>
      </AlertDialogTrigger>
      <AlertDialogContent className="z-[9999]">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GenerateLink;
