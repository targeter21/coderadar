package io.reflectoring.coderadar.projectadministration.port.driven.module;

import io.reflectoring.coderadar.projectadministration.ModuleAlreadyExistsException;
import io.reflectoring.coderadar.projectadministration.ModulePathInvalidException;

public interface CreateModulePort {

  /**
   * Creates a module in a project.
   *
   * @param modulePath The path of the module.
   * @param projectId The id of the project.
   * @return The id of the module.
   * @throws ModuleAlreadyExistsException Thrown if a module with the given path already exists.
   * @throws ModulePathInvalidException Thrown if the supplied path is invalid.
   */
  Long createModule(String modulePath, long projectId)
      throws ModuleAlreadyExistsException, ModulePathInvalidException;
}
