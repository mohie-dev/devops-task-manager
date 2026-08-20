export enum Role {
    ADMIN = 'admin',
    USER = 'user',
}

export enum TaskStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
}

export enum LogAction {
    REGISTER = 'REGISTER',
    LOGIN = 'LOGIN',
    CREATE_TASK = 'CREATE_TASK',
    UPDATE_TASK = 'UPDATE_TASK',
    DELETE_TASK = 'DELETE_TASK',
    READ_ALL_TASKS = 'READ_ALL_TASKS',
    READ_TASK = 'READ_TASK',
}