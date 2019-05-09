package io.reflectoring.coderadar.core.projectadministration.service.project;

import io.reflectoring.coderadar.core.projectadministration.ProjectNotFoundException;
import io.reflectoring.coderadar.core.projectadministration.domain.Project;
import io.reflectoring.coderadar.core.projectadministration.port.driven.project.GetProjectPort;
import io.reflectoring.coderadar.core.projectadministration.port.driven.project.UpdateProjectPort;
import io.reflectoring.coderadar.core.projectadministration.port.driver.project.update.UpdateProjectCommand;
import io.reflectoring.coderadar.core.projectadministration.port.driver.project.update.UpdateProjectUseCase;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UpdateProjectService implements UpdateProjectUseCase {

  private final GetProjectPort getProjectPort;
  private final UpdateProjectPort updateProjectPort;

  @Autowired
  public UpdateProjectService(GetProjectPort getProjectPort, UpdateProjectPort updateProjectPort) {
    this.getProjectPort = getProjectPort;
    this.updateProjectPort = updateProjectPort;
  }

  @Override
  public void update(UpdateProjectCommand command, Long projectId) {
    Optional<Project> project = getProjectPort.get(projectId);

    if (project.isPresent()) {
      Project updatedProject = project.get();
      updatedProject.setName(command.getName());
      updatedProject.setWorkdirName(UUID.randomUUID().toString());
      updatedProject.setVcsUrl(command.getVcsUrl());
      updatedProject.setVcsUsername(command.getVcsUsername());
      updatedProject.setVcsPassword(command.getVcsPassword());
      updatedProject.setVcsOnline(command.getVcsOnline());
      updatedProject.setVcsStart(command.getStart());
      updatedProject.setVcsEnd(command.getEnd());
      updateProjectPort.update(updatedProject);
    } else {
      throw new ProjectNotFoundException(projectId);
    }
  }
}
