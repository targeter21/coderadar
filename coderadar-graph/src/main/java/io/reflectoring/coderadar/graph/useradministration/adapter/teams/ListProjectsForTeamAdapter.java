package io.reflectoring.coderadar.graph.useradministration.adapter.teams;

import io.reflectoring.coderadar.graph.projectadministration.domain.ProjectEntity;
import io.reflectoring.coderadar.graph.projectadministration.project.ProjectMapper;
import io.reflectoring.coderadar.graph.projectadministration.project.repository.ProjectRepository;
import io.reflectoring.coderadar.graph.useradministration.repository.UserRepository;
import io.reflectoring.coderadar.projectadministration.domain.Project;
import io.reflectoring.coderadar.projectadministration.domain.ProjectWithRoles;
import io.reflectoring.coderadar.useradministration.domain.ProjectRole;
import io.reflectoring.coderadar.useradministration.port.driven.ListProjectsForTeamPort;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ListProjectsForTeamAdapter implements ListProjectsForTeamPort {

  private final ProjectMapper projectMapper = new ProjectMapper();
  private final ProjectRepository projectRepository;
  private final UserRepository userRepository;

  public ListProjectsForTeamAdapter(
      ProjectRepository projectRepository, UserRepository userRepository) {
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
  }

  @Override
  public List<Project> listProjects(long teamId) {
    return projectMapper.mapNodeEntities(projectRepository.listProjectsByTeamId(teamId));
  }

  @Override
  public List<ProjectWithRoles> listProjectsWithRolesForUser(long teamId, long userId) {
    List<ProjectEntity> projectEntities = projectRepository.listProjectsByTeamId(teamId);
    List<ProjectWithRoles> result = new ArrayList<>();
    for (ProjectEntity project : projectEntities) {
      Set<String> roles =
          new HashSet<>(userRepository.getUserRolesForProjectInTeams(project.getId(), userId));
      roles.add(userRepository.getUserRoleForProject(project.getId(), userId));
      roles.removeIf(Objects::isNull);
      result.add(
          new ProjectWithRoles(
              projectMapper.mapGraphObject(project),
              roles.stream()
                  .map(s -> ProjectRole.valueOf(s.toUpperCase()))
                  .collect(Collectors.toList())));
    }
    return result;
  }
}
