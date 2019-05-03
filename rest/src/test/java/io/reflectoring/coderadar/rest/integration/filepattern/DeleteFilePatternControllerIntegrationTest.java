package io.reflectoring.coderadar.rest.integration.filepattern;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;

import io.reflectoring.coderadar.rest.integration.ControllerTestTemplate;
import org.junit.jupiter.api.Test;

class DeleteFilePatternControllerIntegrationTest extends ControllerTestTemplate {

  @Test
  void deleteFilePatternWithIdOne() throws Exception {
    mvc().perform(delete("/projects/1/filePatterns/1"));
  }
}
