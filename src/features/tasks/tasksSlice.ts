import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import { RootState } from "../../app/store";

export type TaskId = string;
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
  tasks: {
    eg1: {
      id: "eg1",
      message: "Buy chickpeas",
      blockedBy: [],
      completed: false,
    },
  },
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

    addDependency: (
      state,
      action: PayloadAction<{ dependentTaskId: TaskId; message: string }>
    ) => {
      const { message, dependentTaskId } = action.payload;
      const taskId = uuid();
      state.tasks[taskId] = {
        id: taskId,
        completed: false,
        message: message,
        blockedBy: [],
      };
      const dependent = state.tasks[dependentTaskId];
      dependent.blockedBy = dependent.blockedBy
        ? [...dependent.blockedBy, taskId]
        : [taskId];
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

    editTaskMessage: (
      state,
      action: PayloadAction<{ taskId: TaskId; message: string }>
    ) => {
      if (action.payload.message)
        state.tasks[action.payload.taskId].message = action.payload.message;
      else delete state.tasks[action.payload.taskId];
    },
  },
});

export const {
  addTask,
  addDependency,
  completeTask,
  toggleTask,
  deleteTask,
  editTaskMessage,
} = tasksSlice.actions;

export const selectTaskById = (taskId: TaskId) => (state: TasksState) =>
  state.tasks[taskId];

export const selectAllTasks = (state: RootState) =>
  Object.values(state.tasks.tasks);

export const selectUnblockedTasks = (state: RootState) =>
  Object.values(state.tasks.tasks).filter(
    (task: Task) =>
      !task.blockedBy ||
      task.blockedBy.every(
        (blockerId) => state.tasks.tasks[blockerId].completed
      )
  );

export default tasksSlice.reducer;
