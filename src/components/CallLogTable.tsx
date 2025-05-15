
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Trash2 } from "lucide-react";

interface CallLogTableProps {
  data: any[];
}

const CallLogTable = ({ data }: CallLogTableProps) => {
  const [logs, setLogs] = useState(data);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<any>(null);
  const { toast } = useToast();

  // Update logs when data prop changes
  if (data !== logs) {
    setLogs(data);
    setCurrentPage(1);
  }

  const handleEditClick = (log) => {
    setEditingLog({...log});
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (log) => {
    setLogToDelete(log);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e, field) => {
    setEditingLog({
      ...editingLog,
      [field]: e.target.value
    });
  };

  const handleSaveChanges = () => {
    const updatedLogs = logs.map(log => 
      log === logs.find(item => item.id === editingLog.id) ? editingLog : log
    );
    setLogs(updatedLogs);
    setIsEditDialogOpen(false);
    toast({
      title: "Changes Saved",
      description: "The call log has been updated successfully.",
      variant: "default",
    });
  };

  const handleConfirmDelete = () => {
    const updatedLogs = logs.filter(log => log !== logToDelete);
    setLogs(updatedLogs);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Record Deleted",
      description: "The call log has been deleted successfully.",
      variant: "default",
    });
  };

  // Get current logs for pagination
  const indexOfLastLog = currentPage * rowsPerPage;
  const indexOfFirstLog = indexOfLastLog - rowsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

  // Get column headers from the first log entry
  const columns = logs.length > 0 
    ? Object.keys(logs[0]).filter(key => key !== 'id')
    : [];

  // Calculate total pages
  const totalPages = Math.ceil(logs.length / rowsPerPage);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Call Logs - Page {currentPage} of {totalPages || 1}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">No.</TableHead>
              {columns.map((col) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentLogs.length > 0 ? (
              currentLogs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{indexOfFirstLog + index + 1}</TableCell>
                  {columns.map((col) => (
                    <TableCell key={col}>{log[col] || "-"}</TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(log)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(log)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="text-center">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, logs.length)} of {logs.length} entries
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Call Log</DialogTitle>
            <DialogDescription>
              Make changes to the call log information below.
            </DialogDescription>
          </DialogHeader>
          {editingLog && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {columns.map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>{field}</Label>
                  <Input
                    id={field}
                    value={editingLog[field] || ""}
                    onChange={(e) => handleInputChange(e, field)}
                  />
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveChanges}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this call log? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallLogTable;
