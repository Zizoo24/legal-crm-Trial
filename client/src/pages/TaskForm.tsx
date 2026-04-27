import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type TaskFormData = {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
};

export default function TaskForm() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TaskFormData>({
    defaultValues: {
      status: "todo",
      priority: "medium",
    },
  });

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Task created successfully");
      utils.tasks.list.invalidate();
      navigate("/tasks");
    },
    onError: (error) => toast.error(`Failed to create task: ${error.message}`),
  });

  const onSubmit = (data: TaskFormData) => {
    createTask.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/tasks")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Task</h1>
            <p className="text-gray-600 mt-1">Create a follow-up or internal work item</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <CardDescription>Track a piece of work for the practice</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register("title", { required: true })} />
                {errors.title && <p className="text-sm text-red-600">Title is required</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} {...register("description")} />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={watch("status")} onValueChange={(value) => setValue("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To do</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={watch("priority")} onValueChange={(value) => setValue("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" {...register("dueDate")} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/tasks")}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
