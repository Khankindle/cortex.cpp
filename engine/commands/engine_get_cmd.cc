#include "engine_get_cmd.h"
#include <iostream>
#include <tabulate/table.hpp>
#include "services/engine_service.h"
#include "utils/logging_utils.h"

namespace commands {

void EngineGetCmd::Exec() const {
  CTL_INF("[EngineGetCmd] engine: " << engine_);

  auto engine_service = EngineService();
  try {
    auto status = engine_service.GetEngineInfo(engine_);
    tabulate::Table table;
    table.add_row({"name", "description", "version", "product name", "status"});
    table.format().font_color(tabulate::Color::green);
    table.add_row({status.name, status.description, status.version,
                   status.product_name, status.status});
    std::cout << table << std::endl;
  } catch (const std::runtime_error& e) {
    std::cerr << "Engine " << engine_ << " is not supported!" << "\n";
  } catch (const std::exception& e) {
    std::cerr << "Failed to get engine info for " << engine_ << ": " << e.what()
              << "\n";
  }
}
};  // namespace commands
