package io.reflectoring.coderadar.graph.projectadministration.filepattern;

import io.reflectoring.coderadar.graph.projectadministration.filepattern.repository.DeleteFilePatternRepository;
import io.reflectoring.coderadar.graph.projectadministration.filepattern.service.DeleteFilePatternAdapter;
import org.junit.jupiter.api.DisplayName;

import static org.mockito.Mockito.mock;

@DisplayName("Delete file pattern")
public class DeleteFilePatternServiceTest { // TODO
  private DeleteFilePatternRepository deleteFilePatternRepository =
      mock(DeleteFilePatternRepository.class);
  private DeleteFilePatternAdapter deleteFilePatternAdapter =
      new DeleteFilePatternAdapter(deleteFilePatternRepository);
}
