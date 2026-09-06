-- =========================================================
-- WorkSphere Initial Database Schema
-- Flyway Migration V1
-- =========================================================

-- =========================================================
-- SEQUENCES
-- =========================================================

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 50;

CREATE SEQUENCE departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 50;

CREATE SEQUENCE employees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 50;

CREATE SEQUENCE projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 50;

CREATE SEQUENCE tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 50;

CREATE SEQUENCE attendance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 50;

CREATE SEQUENCE leave_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 50;

CREATE SEQUENCE notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 50;

CREATE SEQUENCE timesheets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 50;


-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id BIGINT NOT NULL DEFAULT nextval('users_id_seq'),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,

    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT users_role_check
        CHECK (role IN ('ADMIN', 'MANAGER', 'EMPLOYEE'))
);


-- =========================================================
-- DEPARTMENTS
-- =========================================================

CREATE TABLE departments (
    id BIGINT NOT NULL DEFAULT nextval('departments_id_seq'),
    name VARCHAR(255) NOT NULL,

    CONSTRAINT departments_pkey PRIMARY KEY (id),
    CONSTRAINT uk_departments_name UNIQUE (name)
);


-- =========================================================
-- EMPLOYEES
-- =========================================================

CREATE TABLE employees (
    id BIGINT NOT NULL DEFAULT nextval('employees_id_seq'),
    employee_code VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    department_id BIGINT,
    title VARCHAR(255),
    joining_date DATE,
    user_id BIGINT NOT NULL,

    CONSTRAINT employees_pkey PRIMARY KEY (id),
    CONSTRAINT uk_employees_employee_code UNIQUE (employee_code),
    CONSTRAINT uk_employees_user_id UNIQUE (user_id),

    CONSTRAINT fk_employees_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_employees_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
);


-- =========================================================
-- PROJECTS
-- =========================================================

CREATE TABLE projects (
    id BIGINT NOT NULL DEFAULT nextval('projects_id_seq'),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    progress INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    priority VARCHAR(255) NOT NULL,
    manager_id BIGINT,
    department_id BIGINT,

    CONSTRAINT projects_pkey PRIMARY KEY (id),

    CONSTRAINT projects_status_check
        CHECK (
            status IN (
                'PLANNING',
                'ACTIVE',
                'ON_HOLD',
                'COMPLETED',
                'CANCELLED'
            )
        ),

    CONSTRAINT projects_priority_check
        CHECK (
            priority IN (
                'LOW',
                'MEDIUM',
                'HIGH',
                'URGENT'
            )
        ),

    CONSTRAINT fk_projects_manager
        FOREIGN KEY (manager_id)
        REFERENCES users(id),

    CONSTRAINT fk_projects_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
);


-- =========================================================
-- TASKS
-- =========================================================

CREATE TABLE tasks (
    id BIGINT NOT NULL DEFAULT nextval('tasks_id_seq'),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    priority VARCHAR(255) NOT NULL,
    due_date DATE,
    project_id BIGINT NOT NULL,
    assignee_id BIGINT,

    CONSTRAINT tasks_pkey PRIMARY KEY (id),

    CONSTRAINT tasks_status_check
        CHECK (
            status IN (
                'TODO',
                'IN_PROGRESS',
                'REVIEW',
                'DONE'
            )
        ),

    CONSTRAINT tasks_priority_check
        CHECK (
            priority IN (
                'LOW',
                'MEDIUM',
                'HIGH',
                'URGENT'
            )
        ),

    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id),

    CONSTRAINT fk_tasks_assignee
        FOREIGN KEY (assignee_id)
        REFERENCES employees(id)
);


-- =========================================================
-- ATTENDANCE
-- =========================================================

CREATE TABLE attendance (
    id BIGINT NOT NULL DEFAULT nextval('attendance_id_seq'),
    attendance_date DATE NOT NULL,
    check_in TIMESTAMP WITHOUT TIME ZONE,
    check_out TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(255) NOT NULL,
    employee_id BIGINT NOT NULL,

    CONSTRAINT attendance_pkey PRIMARY KEY (id),

    CONSTRAINT attendance_status_check
        CHECK (
            status IN (
                'PRESENT',
                'ABSENT',
                'LATE',
                'HALF_DAY'
            )
        ),

    CONSTRAINT uk_attendance_employee_date
        UNIQUE (employee_id, attendance_date),

    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
);


-- =========================================================
-- LEAVE REQUESTS
-- =========================================================

CREATE TABLE leave_requests (
    id BIGINT NOT NULL DEFAULT nextval('leave_requests_id_seq'),
    leave_type VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    employee_id BIGINT NOT NULL,

    CONSTRAINT leave_requests_pkey PRIMARY KEY (id),

    CONSTRAINT leave_requests_leave_type_check
        CHECK (
            leave_type IN (
                'CASUAL',
                'SICK',
                'EARNED',
                'UNPAID'
            )
        ),

    CONSTRAINT leave_requests_status_check
        CHECK (
            status IN (
                'PENDING',
                'APPROVED',
                'REJECTED',
                'CANCELLED'
            )
        ),

    CONSTRAINT fk_leave_requests_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
);


-- =========================================================
-- NOTIFICATIONS
-- =========================================================

CREATE TABLE notifications (
    id BIGINT NOT NULL DEFAULT nextval('notifications_id_seq'),
    message VARCHAR(255) NOT NULL,
    read BOOLEAN NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    user_id BIGINT NOT NULL,

    CONSTRAINT notifications_pkey PRIMARY KEY (id),

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);


-- =========================================================
-- TIMESHEETS
-- =========================================================

CREATE TABLE timesheets (
    id BIGINT NOT NULL DEFAULT nextval('timesheets_id_seq'),
    employee_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    task_id BIGINT,
    work_date DATE NOT NULL,
    hours DOUBLE PRECISION NOT NULL,
    description VARCHAR(255),
    status VARCHAR(255) NOT NULL,

    CONSTRAINT timesheets_pkey PRIMARY KEY (id),

    CONSTRAINT timesheets_status_check
        CHECK (
            status IN (
                'DRAFT',
                'SUBMITTED',
                'APPROVED',
                'REJECTED'
            )
        ),

    CONSTRAINT fk_timesheets_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id),

    CONSTRAINT fk_timesheets_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id),

    CONSTRAINT fk_timesheets_task
        FOREIGN KEY (task_id)
        REFERENCES tasks(id)
);


-- =========================================================
-- SEQUENCE OWNERSHIP
-- =========================================================

ALTER SEQUENCE users_id_seq
    OWNED BY users.id;

ALTER SEQUENCE departments_id_seq
    OWNED BY departments.id;

ALTER SEQUENCE employees_id_seq
    OWNED BY employees.id;

ALTER SEQUENCE projects_id_seq
    OWNED BY projects.id;

ALTER SEQUENCE tasks_id_seq
    OWNED BY tasks.id;

ALTER SEQUENCE attendance_id_seq
    OWNED BY attendance.id;

ALTER SEQUENCE leave_requests_id_seq
    OWNED BY leave_requests.id;

ALTER SEQUENCE notifications_id_seq
    OWNED BY notifications.id;

ALTER SEQUENCE timesheets_id_seq
    OWNED BY timesheets.id;