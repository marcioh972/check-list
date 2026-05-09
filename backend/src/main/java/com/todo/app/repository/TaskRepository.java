package com.todo.app.repository;

import com.todo.app.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByOrderByCreatedAtDesc();

    List<Task> findByDoneOrderByCreatedAtDesc(boolean done);
}
