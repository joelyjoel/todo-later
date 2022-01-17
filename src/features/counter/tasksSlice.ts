import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import { RootState } from "../../app/store";

export type TaskId = keyof TasksState["tasks"];
export interface Task {
  id: TaskId;
  completed: boolean;
  message: string;
  blockedBy: TaskId[];
}

export interface TasksState {
  tasks: {
    [taskId: string]: Task;
  };
}

const initialState: TasksState = {
  tasks: {},
};

export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<string>) => {
      const taskId = uuid();
      const message: string = action.payload;
      state.tasks[taskId] = {
        id: taskId,
        completed: false,
        message,
        blockedBy: [],
      };
    },

    completeTask: (state, action: PayloadAction<TaskId>) => {
      const task = selectTaskById(action.payload)(state);
      task.completed = true;
    },

    toggleTask: (state, action: PayloadAction<TaskId>) => {
      const task = selectTaskById(action.payload)(state);
      task.completed = !task.completed;
    },

    deleteTask: (state, action: PayloadAction<TaskId>) => {
      delete state.tasks[action.payload];
      // TODO: Handle dependent tasks?
    },
  },
});

export const { addTask, completeTask, toggleTask, deleteTask } =
  tasksSlice.actions;

export const selectTaskById = (taskId: TaskId) => (state: TasksState) =>
  state.tasks[taskId];

export const selectAllTasks = (state: RootState) =>
  Object.values(state.tasks.tasks);

export const selectUnblockedTasks = (state: TasksState) =>
  Object.values(state).filter((task: Task) =>
    task.blockedBy.every(
      (blockerId) => selectTaskById(blockerId)(state).completed
    )
  );

export default tasksSlice.reducer;
