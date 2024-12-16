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
  } from "@/components/ui/alert-dialog"
  import { Button } from "@/components/ui/button"
  
export function DeleteConfirmDialog({ triggerButton, title, description, confirmAction }
    : { triggerButton: any, title: string, description: string, confirmAction: any }) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {triggerButton}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
                    <AlertDialogTitle>{ title }</AlertDialogTitle>
            <AlertDialogDescription>
              { description }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <button
                            onClick={confirmAction}
                            className="bg-red-800 hover:bg-red-600">
                            Delete
                        </button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  